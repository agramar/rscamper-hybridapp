angular.module('App')
// 설정 정보 관련 서비스
  .factory("MyConfig", function () {
    return {
      backEndURL: "http://192.168.0.187:8081/app", // 학원 서버 컴퓨터 외부
      // backEndURL: "http://192.168.0.190:8081/app", // 학원 서버 컴퓨터 외부
      // backEndURL: "http://192.168.0.9:8081/app", // 학원 서버 컴퓨터 로컬
      // backEndURL: "http://192.168.0.228:8081/app", // 학원 내컴퓨터
      // backEndURL: "http://192.168.1.13:8081/app", // 집
      googleAuthURL: "apps.googleusercontent.com",
      googleClientId: "506479374537-4o2pa5ghuj68ocudca9fbohmikfsth56",
      facebookClientId: "947628548702706",
      twitterConsumerKey: "	ngAkhEdE4XsaQNJrtzfG4kNAH",
      twitterConsumerSecret: "UD6mJDHCpIQnhsRhxbpbSY3oImf1ekFkO8oljs2Yctk1oCLdjf"
    };
  })

// 팝업창 사용을 위한 서비스
  .factory("MyPopup", ["$ionicPopup", function ($ionicPopup) {
    return {
      alert: function (title, template) {
        $ionicPopup.alert({
          title: title,
          template: template
        })
          .then(function (res) {
          });
      },
      confirm: function (title, template, yesCB, noCB) {
        $ionicPopup.confirm({
          title: title,
          template: template,
          cancelText: "취소",
          okText: "확인"
        })
          .then(function (res) {
            if (res) {
              yesCB();
            } else {
              noCB();
            }
          });
      },
      prompt: function (title, subTitle, resultCB, defaultText) {
        $ionicPopup.prompt({
          title: title,
          template: subTitle,
          inputType: 'text',
          inputPlaceholder: '',
          defaultText: defaultText,
          cancelText: '취소',
          // cancelType:
          okText: '확인',
          // okType:
        }).then(resultCB)
      }
    }
  }])

  // 로딩 관련 서비스
  .factory("MyLoading", ["$ionicLoading"], function ($ionicLoading) {
    return {
      show: function (template, duration) {
        $ionicLoading.show({
          template: template,
          duration: duration
        }).then(function () {

        });
      },
      hide: function () {
        $ionicLoading.hide().then(function () {

        });
      }
    }
  })

  // 유효성 체크 서비스
  .factory("ValChkService", function (MyPopup) {
    return {
      validationCheck: function (type, value) {
        switch (type) {
          case "null":
            if (!value) {
              MyPopup.alert("알림", "입력되지 않은 값이 있습니다.");
              return false;
            }
            return true;
          case "email": // 이메일 형식 체크(정규식)(not null)
            if (!value) {
              MyPopup.alert("알림", "이메일을 입력해 주세요.");
              return false;
            }
            if (!value.match(/[0-9a-zA-Z][_0-9a-zA-Z-]*@[_0-9a-zA-Z-]+(\.[_0-9a-zA-Z-]+){1,2}$/)) {
              MyPopup.alert("알림", "올바른 이메일 형식이 아닙니다.");
              return false;
            }
            return true;
          case "password": // 6~20자 문자숫자혼합(정규식)(not null)
            if (!value) {
              MyPopup.alert("알림", "비밀번호를 입력해 주세요");
              return false;
            }
            if (!value.match(/^.*(?=.{6,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/)) {
              MyPopup.alert("알림", "올바른 비밀번호 형식(영문자/숫자조합 6~20자)이 아닙니다.");
              return false;
            }
            return true;
          case "displayName": // 20자 이하(not null)
            if (!value) {
              MyPopup.alert("알림", "사용자 이름을 입력해 주세요.");
              return false;
            }
            if (value.length > 20) {
              MyPopup.alert("알림", "입력된 사용자 이름이 너무 깁니다.(20자이하)");
              return false;
            }
            return true;
          case "phoneNumber": // 전화번호 형식(정규식)(널가능)
            if (value) {
              if (!value.match(/^\d{2,3}-\d{3,4}-\d{4}$/)) {
                MyPopup.alert("알림", "올바른 전화번호를 입력해 주세요.");
                return false;
              }
            }
            return true;
          case "websiteUrl":// 인터넷 주소(정규식)(널가능)
            if (value) {
              if (!value.match(/^(http?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w_\.-]*)*\/?$/)) {
                MyPopup.alert("알림", "올바른 인터넷 주소를 입력해 주세요.");
                return false;
              }
            }
            return true;
          case "introduce": // 1000자이하(널가능)
            if (value) {
              if (value.length > 1000) {
                MyPopup.alert("알림", "입력된 자기소개 내용이 너무 깁니다.(1000자이하)");
                return false;
              }
            }
            return true;
          case "birthday": // 현재보다 과거인지 체크(널가능)
            if (value) {
              if (new Date() < new Date(value)) {
                MyPopup.alert("알림", "현재보다 과거를 선택해야 합니다.");
                return false;
              }
            }
            return true;
        }
        return false;
      }
    }
  })

  // LocalStorage사용을 위한 셋팅
  .factory("Localstorage", ["$window", function ($window) {
    return {
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        return JSON.parse($window.localStorage[key] || "{}");
      },
      remove: function (key) {
        $window.localStorage.removeItem(key);
      }
    }
  }])
;
