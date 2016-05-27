/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

use std::fs::{self, File};
use std::io::{Read, Write};
use util::basedir;
use util::prefs::{PrefValue, extend_prefs, read_prefs_from_file, get_pref, set_pref, reset_pref};

#[test]
fn test_create_pref() {
    let json_str = "{\
  \"layout.writing-mode.enabled\": true,\
  \"network.mime.sniff\": false,\
  \"shell.homepage\": \"http://servo.org\"\
}";

    let prefs = read_prefs_from_file(json_str.as_bytes());
    assert!(prefs.is_ok());
    let prefs = prefs.unwrap();

    assert_eq!(prefs.len(), 3);
}

#[test]
fn test_get_set_reset_extend() {
    let json_str = "{\
  \"layout.writing-mode.enabled\": true,\
  \"extra.stuff\": false,\
  \"shell.homepage\": \"https://google.com\"\
}";

    assert_eq!(*get_pref("test"), PrefValue::Missing);
    set_pref("test", PrefValue::String("hi".to_owned()));
    assert_eq!(*get_pref("test"), PrefValue::String("hi".to_owned()));
    assert_eq!(*get_pref("shell.homepage"), PrefValue::String("http://servo.org".to_owned()));
    set_pref("shell.homepage", PrefValue::Boolean(true));
    assert_eq!(*get_pref("shell.homepage"), PrefValue::Boolean(true));
    reset_pref("shell.homepage");
    assert_eq!(*get_pref("shell.homepage"), PrefValue::String("http://servo.org".to_owned()));

    let extension = read_prefs_from_file(json_str.as_bytes()).unwrap();
    extend_prefs(extension);
    assert_eq!(*get_pref("shell.homepage"), PrefValue::String("https://google.com".to_owned()));
    assert_eq!(*get_pref("layout.writing-mode.enabled"), PrefValue::Boolean(true));
    assert_eq!(*get_pref("extra.stuff"), PrefValue::Boolean(false));
}

#[test]
fn test_default_config_dir_create_read_write() {
  let json_str = "{\
  \"layout.writing-mode.enabled\": true,\
  \"extra.stuff\": false,\
  \"shell.homepage\": \"https://google.com\"\
}";
    let mut expected_json = String::new();
    let config_path = basedir::default_config_dir().unwrap();

    if !config_path.exists() {
      fs::create_dir_all(&config_path).unwrap();
    }

    let json_path = config_path.join("test_config.json");

    let mut fd = File::create(&json_path).unwrap();
    assert_eq!(json_path.exists(), true);

    fd.write_all(json_str.as_bytes()).unwrap();
    let mut fd = File::open(&json_path).unwrap();
    fd.read_to_string(&mut expected_json).unwrap();

    assert_eq!(json_str, expected_json);

    fs::remove_file(&json_path).unwrap();
}
