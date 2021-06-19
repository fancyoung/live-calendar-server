const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const PORT = 3333;

const app = new Koa();
const router = new Router();

let schedule = {
  '2021-06-22': [
    { startTime: 9, memberId: 'ma' },
    { startTime: 9, memberId: 'mb', visitorId: 'va' },
    { startTime: 9, memberId: 'mc' },
    { startTime: 15, memberId: 'mb', visitorId: 'vc' }
  ]
};

app.use(bodyParser())

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World !';
});


router.get('/schedule/:date', (ctx, next) => {
  let date = ctx.params.date;
  ctx.body = { data: schedule[date] };
});

router.post('/schedule/:date', (ctx, next) => {
  let date = ctx.params.date;
  let body = ctx.request.body;

  let list = [...schedule[date]];
  let index = list.findIndex(v => v.memberId == body.memberId && v.startTime == body.startTime);
  if(body.isAvailable && index < 0) {
    list.push({ startTime: body.startTime, memberId: body.memberId });
  } else if(!body.isAvailable && index >= 0) {
    list.splice(index, 1);
  }
  schedule[date] = list;
  ctx.body = { data: schedule[date] };
});

router.post('/schedule/:date/:time/:member', (ctx, next) => {
  let date = ctx.params.date;
  let startTime = ctx.params.time;
  let memberId = ctx.params.member;
  let visitorId = ctx.request.body.visitorId;
  let isJoin = ctx.request.body.isJoin;

  let list = [...schedule[date]];
  let msg = '';
  let index = list.findIndex(v => v.memberId == memberId && v.startTime == startTime);
  if(index >= 0) {
    if(isJoin) {
      if(list[index].visitorId) {
        if(visitorId == list[index].visitorId) {
          msg = '已预约，请勿重复操作';
        } else {
          msg = '已被他人预约';
        }
      } else {
        list[index] = {
          ...list[index],
          visitorId
        };
        msg = '预约成功';
      }
    } else if(visitorId == list[index].visitorId) {
      list[index] = {
        ...list[index],
        visitorId: null
      };
        msg = '取消预约';
    }
  } else {
    msg = '此时间段不可预约';
  }
  schedule[date] = list;
  ctx.body = { data: schedule[date], msg };
});

app.use(router.routes());

app.listen(PORT);
console.log('LISTEN: ' + PORT);