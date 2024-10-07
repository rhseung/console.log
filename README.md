# ts-module-template

## Tools
- Bot App: [메신저봇R](https://github.com/MessengerBotTeam/msgbot-old-release/releases/tag/0.7.36a) (0.7.36a 버전 이상)
- CI/CD: GitHub Actions
- Module Bundler: [rollup](https://rollupjs.org/)
- Test: [vitest](https://vitest.dev/)
- Execute: [tsx](https://tsx.is/)
- Runtime: [node.js](https://nodejs.org/en)

## Prepare
1. 레포지토리 설정에서 `GitHub Actions` 가 적절한 권한을 가지고 있는지 확인하세요.
    - `Settings > Actions > General` 로 이동합니다.
    - `Workflow permissions` 에서 `Read and write permissions` 를 선택하고 저장합니다.
2. `package.json` 파일을 열어 `name`, `version`, `description`, `author`, `license` 등의 필드를 적절히 수정합니다.
3. `npm install` 명령어를 실행하여 의존성 패키지를 설치합니다.