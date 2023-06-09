# 1. 만들게 된 이유

Spotify로 내가 듣는 음악을 공유하고 싶다는 단순한 마음으로 만들게 되었습니다.

# 2. 기반

Electron을 사용해 만들었습니다.

# 3. 작동 방식

1. Spotify API를 활용해 Access Token을 구합니다.
2. 10초 마다 API를 통해 듣고 있는 음악을 구합니다.
3. 페이지에 업데이트 합니다.
4. 듣는 횟수와 월별 듣는 횟수를 1씩 늘립니다.
5. 듣는 횟수가 5 이상일 경우 `html2canvas`를 사용해 HTML Element를 이미지로 변환후 `instagram-private-api`를 사용해 인스타에 업로드 합니다.

# 3-1. 가장 많이 들은 음악의 작동 방식

1. 이전에 프로그램을 실행했을 때와 현재의 월이 다른 경우 가장 많이 들은 음악 이미지를 생성후 인스타에 업로드 합니다.
2. 그냥 sort 함수를 사용해 정렬합니다.

# 4. 격었던 문제

1. 인스타그램에 업로드할때 jpg만 지원하는지 모르고 png로 삽질을 했습니다.
2. 인스타 계정이 임시 차단 당했습니다.
3. 가장 많이 들은 음악을 `priority queue`로 만들려고 삽질했습니다.

# 4-2 임시차단

빠른 시간 안에 너무 많은 사진을 업로드하여 임시 차단 당한것 같습니다. 그래서 5개씩 묶어 올리는것으로 방식을 병경하였습니다.
