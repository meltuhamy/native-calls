// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var aM = null;

function moduleDidLoad() {
  aM = new NaClAM('nacl_module');
  aM.enable();

  init();
  animate();
  NaClAMBulletInit();
  loadJenga20();
}
