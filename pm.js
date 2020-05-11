import * as cryptolib from './cryptolib.js';
import tmpl from './tmpl.js';

(function() {

/** @noinline */
const getEl = id => document.getElementById(id);

class Cipher {
  constructor(password) {
    this.encrypt = text => cryptolib.encrypt(password, text);
    this.decrypt = cipherText => cryptolib.decrypt(password, cipherText);
  }
}

const changeTemp = function(clsName, ...elements) {
  elements.forEach(e => e.classList.add(clsName));
  window.setTimeout(() => elements.forEach(e => e.classList.remove(clsName)), 1000);
}

class PassType {
  constructor() {
  }
  create() {
    const df = document.createElement('div');
    df.innerHTML = tmpl('passEdit', {
      'title': '',
      data: [
        { name: 'Website', value: '', type: 'text', placeholder: 'URL' },
        { name: 'LoginId', value: '', type: 'text', placeholder: 'Username' },
        { name: 'Password', value: '', type: 'password', placeholder: 'Password' }
      ]
    }, null);
    // Add the following event listeners.
    // Add entry.
    // Remove entry.
    // Reorder entry.
    // Toggle type.
    // Generate password.
    return df;
  }
  view() {
  }
  edit() {
  }
}

class CCType {
  constructor() {
  }
  create() {
  }
  view() {
  }
  edit() {
  }
}

class NoteType {
  constructor() {
  }
  create() {
  }
  view() {
  }
  edit() {
  }
}

const handlers = {
  'Password': new PassType(),
  'Credit Card': new CCType(),
  'Note': new NoteType()
}

class Data {
  constructor(delegate, id, data = {}) {
    this.id = id;
    this.data = data;
    this.save = () => delegate.save(this);
    this.cancel = () => delegate.cancel(this);
  }
}

class PM {
  constructor() {
    this.unlockPane = getEl('unlockPane');
    this.newPasswordPane = getEl('newPasswordPane');
    this.changePasswordPane = getEl('changePasswordPane');
    this.mainPane = getEl('mainPane');
    this.menu = getEl('menu');
    this.contentPane = getEl('contentPane');
    this.unlockPane.style.display = 'none';
    this.newPasswordPane.style.display = 'none';
    this.changePasswordPane.style.display = 'none';
    this.mainPane.style.display = 'none';

    this.key = null;
    this.header = null;
    this.data = null;
    this.cipher = null;
    this.currentView = null;
    this.lastIndex = 0;
  }
  // Global actions.
  save() {
    const cloneNode = document.cloneNode(true);
    cloneNode.getElementById('contentPane').innerHTML = '';
    cloneNode.getElementById('menu').innerHTML = '';
    cloneNode.getElementById('key').innerHTML = JSON.stringify(this.key);
    cloneNode.getElementById('header').innerHTML = this.cipher.encrypt(JSON.stringify(this.header));
    cloneNode.getElementById('data').innerHTML = JSON.stringify(this.data);
    const blob = new Blob([cloneNode.documentElement.outerHTML], { "type": "text/html" });
    const url = URL.createObjectURL(blob);
    const paths = document.location.pathname.split("/");
    const fName = paths[paths.length - 1] || "index.html";
    const a = document.createElement('a');
    a.href = url;
    a['download'] = fName;
    a.click();
    // Remove the blob url in 5 minutes.
    window.setTimeout(URL.revokeObjectURL.bind(null, url), 5 * 60 * 1000);
    return false;
  }
  add() {
    this.contentPane.innerHTML = tmpl('addNew', { 'handlers': handlers }, null);
    const root = this.contentPane.getElementsByClassName('editor')[0];
    const f = this.addType.bind(this);
    for (let e of root.getElementsByClassName('newEl')) {
      e.addEventListener('click', f);
    }
  }
  addType(e) {
    e.preventDefault();
    const handlerName = e.target.getAttribute('data-handler');
    const newEl = handlers[handlerName].create();
    while (this.contentPane.firstChild) {
      this.contentPane.removeChild(this.contentPane.firstChild);
    }
    this.contentPane.appendChild(newEl);
  }
  lock() {
    this.header = null;
    this.cipher = null;
    this.showUnlock();
  }
  async unlock() {
    const passwordEl = getEl('unlockPassword');
    const pass = passwordEl.value;
    if (pass == '') {
      // Password cannot be empty.
      changeTemp('invalid', passwordEl);
      return;
    }
    try {
      const decryptedKey = await cryptolib.decrypt(pass, this.key);
      this.cipher = new Cipher(decryptedKey);
      // Reset old value.
      passwordEl.value = '';
      const encryptedHeader = PM.getScriptValue('header', '');
      this.header = encryptedHeader ==  '' ? [] : JSON.parse(await this.cipher.decrypt(encryptedHeader));
      this.showMainUI();
    } catch(err) {
      changeTemp('invalid', passwordEl);
    }
  }
  async initNewPassword() {
    const newPasswordEl = getEl('newPassword');
    const verifyPasswordEl = getEl('verifyPassword');
    const newPass = newPasswordEl.value;
    const verifPass = verifyPasswordEl.value;
    if (newPass == '') {
      // Password cannot be empty.
      changeTemp('invalid', newPasswordEl);
      return;
    }
    if (verifPass != newPass) {
      // Password mismatch.
      changeTemp('invalid', newPasswordEl, verifyPasswordEl);
      return;
    }
    // Clear off old values.
    newPasswordEl.value = '';
    verifyPasswordEl.value = '';
    // Generate a new key and encrypt it with this password.
    const key = PM.makeKey(10);
    this.key = await cryptolib.encrypt(newPass, key);
    this.showUnlock();
  }
  // Actions in change password.
  async updatePassword() {
    const currentPasswordEl = getEl('currentPassword');
    const updatedPasswordEl = getEl('updatedPassword');
    const updatedVerifyPasswordEl = getEl('updatedVerifyPassword');
    const oldPass = currentPasswordEl.value;
    const newPass = updatedPasswordEl.value;
    const verifyPass = updatedVerifyPasswordEl.value;
    if (newPass == '') {
      // Password cannot be empty.
      changeTemp('invalid', updatedPasswordEl);
      return;
    }
    if (newPass != verifyPass) {
      // Passwords mismatch
      changeTemp('invalid', updatedPasswordEl, updatedVerifyPasswordEl);
      return;
    }
    try {
      const decryptedKey = await cryptolib.decrypt(oldPass, this.key);
      this.key = await cryptolib.encrypt(newPass, decryptedKey);
      this.showMainUI();
    } catch(err) {
      // Password does not match.
      changeTemp('invalid', currentPasswordEl);
    }
  }
  // Initialization methods.
  initHandlers() {
    const ops = [
      { name: 'save', fx: this.save },
      { name: 'add', fx: this.add },
      { name: 'lock', fx: this.lock },
      { name: 'changePassword', fx: this.showChangePassword },
      { name: 'cancelPasswordReset', fx: this.showMainUI }
    ];
    this.registerListeners(ops, 'click');
    const frms = [
      { name: "unlockForm", fx: this.unlock },
      { name: "newPasswordForm", fx: this.initNewPassword },
      { name: "changePasswordForm", fx: this.updatePassword }
    ];
    this.registerListeners(frms, 'submit');
  }
  registerListeners(ops, evt) {
    for (let obj of ops) {
      let el = obj.name instanceof Node ? obj.name : getEl(obj.name);
      if (!el) {
        console.log("cannot find: " + obj.name);
        continue;
      }
      el.addEventListener(evt, e => e.preventDefault());
      el.addEventListener(evt, obj.fx.bind(this));
    }
  }
  initData() {
    this.key = PM.getScriptValue('key', '');
    // Header has to be decrypted.
    // this.header = PM.getScriptValue('header', '');
    this.data = PM.getScriptValue('data', []);
  }
  initUI() {
    if (this.key == "") {
      this.showNewPassword();
    } else {
      this.showUnlock();
    }
  }
  swapView(newView) {
    if (this.currentView) {
      this.currentView.style.display = 'none';
      for (let el of this.currentView.getElementsByClassName("reset")) {
        el.value = '';
      }
    }
    this.currentView = newView;
    newView.style.display = '';
    const els = newView.getElementsByClassName('def');
    if (els.length == 1) {
      els[0].focus();
    }
  }
  showNewPassword() {
    this.swapView(this.newPasswordPane);
  }
  showUnlock() {
    this.swapView(this.unlockPane);
  }
  showChangePassword() {
    this.swapView(this.changePasswordPane);
  }
  showMainUI() {
    this.swapView(this.mainPane);
    // Setup the sidebar with entries.
    this.updateMenu();
  }
  updateContent(e) {
    e.preventDefault();
    const el = e.target;
    const index = parseInt(el.getAttribute('data-index'), 10);
    const content = this.cipher.decrypt(this.data[index]);
    const type = content.type;
    // handlers[type].getView(content);
    // update selected tag.
    this.lastIndex = index;
  }
  updateMenu() {
    this.menu.innerHTML = '';
    const len = this.header.length;
    const listener = this.updateContent.bind(this);
    for (let i = 0; i < len; ++i) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.setAttribute('data-index', i);
      a.appendChild(document.createTextNode(this.header[i].name));
      a.addEventListener('click', listener);
      li.appendChild(a);
      this.menu.appendChild(li);
    }
  }
  start() {
    this.initHandlers();
    this.initData();
    this.initUI();
  }
  // Static methods.
  static getScriptValue(scriptId, defaultValue) {
    const val = getEl(scriptId).innerHTML;
    if (val == "") {
      return defaultValue;
    }
    return JSON.parse(val);
  }
  static makeKey(numWords) {
    const arr = crypto.getRandomValues(new Uint8Array(numWords * 4));
    return String.fromCharCode.apply(null, arr);
  }
}

window.addEventListener('load', () => new PM().start());
})();
