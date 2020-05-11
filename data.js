var encryptedKey;

var headers = [
  {title: 'Gmail harishjp', index: 0, type: 'pass', folder: 'mail'},
  {title: 'Gmail electron', index: 1, type: 'pass', folder: 'mail'},
  {title: 'ICICI bank', index: 2, type: 'pass', folder: 'finance'},
  {title: 'ICICI cc', index: 3, type: 'cc', folder: 'finance'},
  {title: 'Test note', index: 4, type: 'note', folder: 'test'}
]

var data = [
  {title: 'Gmail harishjp', type: 'pass', username: 'harishjp', password: 'asfdsafasfd', secret_question1: 'The random one', secret_answer1: '2', otp_backup: [1, 2, 3], notes: '', website: 'http://www.google.com/'},
  {title: 'Gmail electron', type: 'pass', username: 'eminus.forum@gmail.com', password: 'asfdsafasfd', secret_question1: 'The random one', secret_answer1: '2', otp_backup: [1, 2, 3], notes: '', website: 'http://www.google.com/'},
  {title: 'ICICI bank', type: 'pass', username: 'harishjp', password: 'asfdsafasfd', website: 'https://www.icicibank.co.in/'},
  {title: 'ICICI cc', type: 'cc', bank: 'ICICI Bank', ccno : '4123400460078002', cvv: '666', pin: '4444', onlinepin: '2222'},
  {title: 'Test note', type: 'note', content: 'We should be hitting people really hard with everything we get'}
]
