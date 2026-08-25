# 로컬 Caddy 프록시 (개발 전용)

배포(Vercel)에서는 쓰지 않습니다. 팀 게이트웨이(`API_URL`)를 쓸 때도 필요 없습니다.

## 1. 문제와 적용 시점

프론트는 게이트웨이용 path를 씁니다. (`/api/agit/api/v1/...`)  
`API_URL`은 호스트 하나라서, 로컬에서 user·agit를 **다른 포트**로 띄우면 요청이 한곳으로만 갑니다.  
게이트웨이 없이 치면 path에서 `/api/agit`가 안 떨어져 서비스의 `/api/v1/...`과 안 맞습니다.

이 프록시는 `:8000`에서 경로만 나눠 주고, `/api/{serviceId}`를 뗍니다. Next의 `API_URL=http://localhost:8000`은 그대로입니다.


| 서비스        | 포트   | 게이트웨이 prefix                                 |
| ---------- | ---- | -------------------------------------------- |
| user       | 8080 | `/api/user`                                  |
| diary      | 8081 | `/api/diary`                                 |
| chat       | 8082 | `/api/chat`                                  |
| agit       | 8083 | `/api/agit`                                  |
| topic      | 8084 | `/api/topic`                                 |
| video      | 8085 | `/api/video`                                 |
| point      | 8086 | `/api/point`                                 |
| shop       | 8087 | `/api/shop`                                  |
| backoffice | 8088 | `/api/backoffice`                            |


**이럴 때만 사용**

- 로컬에서 게이트웨이 없이 **여러 서비스**를 직접 띄울 때
- 프론트 path는 지금처럼 게이트웨이 형태를 유지하고 싶을 때

팀 공유 게이트웨이에 붙으면 Caddy는 켜지 않습니다.

## 2. 설치 (도커 없이)

macOS:

```bash
brew install caddy
```

Windows:

```bash
winget install Caddy
```

또는 [Caddy 설치 문서](https://caddyserver.com/docs/install).

도커로도 가능합니다. `Caddyfile`의 `localhost`는 컨테이너 기준이라, 호스트 서비스는 `host.docker.internal`로 바꿉니다. 기본은 도커 없이 `caddy run`입니다.

## 3. 실행 순서

필요한 로컬 서비스만 켜도 됩니다. 포트는 `Caddyfile`과 같아야 합니다.

1. 사용할 서비스 실행 (예: user `:8080`, agit `:8083`)
2. 프로젝트 루트에서 프록시 실행

```bash
caddy run
```

1. `.env.local`에 `API_URL=http://localhost:8000`
2. `npm run dev` (Next `:3000`)

끄기: 프록시 터미널에서 `Ctrl+C`.

확인: `http://localhost:8000/api/agit/api/v1/agits/me` 로 요청이 agit의 `/api/v1/agits/me`로 전달되면 됩니다.