# console.log

```js
const console = require('console')(Log);
// 혹은 전체 로그에 띄우고 싶다면
const console = require('console')(GlobalLog);
```

## 지원하는 메소드

- console.stringify  
  `console.log` 의 출력물을 문자열로 가져오는 함수입니다. `msg.reply(console.stringify(obj))` 처럼 `JSON.stringify`를 대체하여 사용할 수 있는 함수입니다.
- [console.log](https://developer.mozilla.org/en-US/docs/Web/API/console/log_static)  
  `console.log(obj)`로 객체 출력기로써 사용이 가능하고, `console.log("hello world %s", "kakao")`처럼 포매팅도 지원합니다.
- [console.info](https://developer.mozilla.org/en-US/docs/Web/API/console/info_static)  
  `console.log`와 완전 동일합니다.
- [console.error](https://developer.mozilla.org/en-US/docs/Web/API/console/error_static)  
  `console.log`와 같은 기능을 하고 같은 인자를 받으나, 로그에서 에러 메시지 타입으로 출력됩니다.
- [console.warn](https://developer.mozilla.org/en-US/docs/Web/API/console/warn_static)  
  `console.error`와 완전 동일합니다.
- [console.debug](https://developer.mozilla.org/en-US/docs/Web/API/console/debug_static)  
  `console.log`와 같은 기능을 하고 같은 인자를 받으나, 로그에서 디버그 메시지 타입으로 출력됩니다.
- [console.time](https://developer.mozilla.org/en-US/docs/Web/API/console/time_static)  
  `console.time(label)`을 하면 `label` 이름의 타이머가 실행됩니다.
- [console.timeLog](https://developer.mozilla.org/en-US/docs/Web/API/console/timeLog_static)  
  `console.timeLog(label)`을 하면 `label` 이름의 타이머가 실행된지 얼마나 지났는지 확인합니다.
- [console.timeEnd](https://developer.mozilla.org/en-US/docs/Web/API/console/timeEnd_static)  
  `console.timeLog(label)`을 하면 `label` 이름의 타이머가 실행된지 얼마나 지났는지 확인하고 삭제합니다.

## 예시

<img src=https://github.com/user-attachments/assets/b7ad8984-c5da-46cc-9021-06d3ab8f8409 width=450/>
