angular.module("App")
  // timesince 필터
  .filter('timesince',function(){
    return timeSince;
    function timeSince(date, lang) {

      var langs = {
        en: {
          years: " years ago",
          months: " months ago",
          days: " days ago",
          hours: " hours ago",
          minutes: " minutes ago",
          seconds: " seconds ago",
          now: "now"
        },
        it: {
          years: " anni fa",
          months: " mesi da",
          days: " giorni fa",
          hours: " ore fa",
          minutes: " minuti fa",
          seconds: " secondi fa",
          now: "adesso"
        },
        kr: {
          years: "년전",
          months: "달전",
          days: "일전",
          hours: "시간전",
          minutes: "분전",
          seconds: "초전",
          now: "지금"
        }
      };

      var selectedLang = langs.en;

      if ( lang != null && langs[lang]!=null){
        selectedLang = langs[lang];
      }

      if ( date == null)
        return "";

      date = new Date(date);

      var seconds = Math.floor((new Date() - date) / 1000);
      var interval = Math.floor(seconds / 31536000);
      if (interval > 1) {
        return interval + selectedLang.years;
      }
      interval = Math.floor(seconds / 2592000);
      if (interval > 1) {
        return interval + selectedLang.months;
      }
      interval = Math.floor(seconds / 86400);
      if (interval > 1) {
        return interval + selectedLang.days;
      }
      interval = Math.floor(seconds / 3600);
      if (interval > 1) {
        return interval + selectedLang.hours;
      }
      interval = Math.floor(seconds / 60);
      if (interval > 1) {
        return interval + selectedLang.minutes;
      }

      if ( Math.floor(seconds) == 0 ){
        return selectedLang.now;
      }else
        return Math.floor(seconds) + selectedLang.seconds;
    }
  });

