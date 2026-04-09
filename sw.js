// ═══════════════════════════
//  TOSS · Service Worker
// ═══════════════════════════

// Mini question generator (subset for notifications)
const ZONES = ['桌上','地上','包里','浴室里','厨房里'];
const ITEMS = [
  ['笔','纸','充电线','小摆件','数据线','便利贴','优惠券'],
  ['袋子','快递箱','鞋','杂物','盒子'],
  ['小票','会员卡','小物件','纸巾','卡'],
  ['瓶子','试用装','护肤品','毛巾','药'],
  ['调料','餐具','塑料袋','海绵','厨房工具'],
];
const CONDS = [
  '过期的','坏了的','重复的','不用的','空的',
  '超过一周没碰的','不知道什么时候放的','积灰的',
  '不需要的','该扔的','占地方的','忘了它存在的',
];
const PATTERNS = [
  (z,i,c) => `${z}有没有${c}${i}？`,
  (z,i,c) => `看一下${z}，有${c}${i}吗？`,
  (z,i,c) => `翻一下${z}。${c}${i}可以清掉了。`,
  (z,i) => `${z}的${i}，还在用吗？`,
  (z) => `从${z}找出一件不需要的东西。就一件。`,
];

function genQuestion() {
  const zi = Math.floor(Math.random() * ZONES.length);
  const z = ZONES[zi];
  const items = ITEMS[zi];
  const i = items[Math.floor(Math.random() * items.length)];
  const c = CONDS[Math.floor(Math.random() * CONDS.length)];
  const p = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  return p(z, i, c);
}

// Push event
self.addEventListener('push', event => {
  const question = genQuestion();
  const options = {
    body: question,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🗑</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">扔</text></svg>',
    tag: 'toss-daily',
    renotify: true,
    data: { url: self.registration.scope },
  };
  event.waitUntil(
    self.registration.showNotification('扔', options)
  );
});

// Click notification → open app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(list => {
      for (const client of list) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});

// Install & activate
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
