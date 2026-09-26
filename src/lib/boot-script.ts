/**
 * Runs synchronously in <head> before first paint:
 *  - applies the saved theme (no flash of the wrong theme),
 *  - applies the saved article text size (no layout shift),
 *  - resolves consent flags so ad containers / trackers know their state.
 * Mirrors the logic in components/consent/consent.ts.
 */
export function bootScript(consentRegions: string) {
  const regions = JSON.stringify(consentRegions.trim().toUpperCase())
  return `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme")||"system";var dark=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);d.classList.toggle("dark",dark);d.dataset.theme=t;var s=localStorage.getItem("article-size");if(s)d.dataset.articleSize=s}catch(e){}try{var c=document.cookie,m=c.match(/(?:^|; )fs_consent=([^;]*)/),a=0,ad=0;if(m){var v=JSON.parse(decodeURIComponent(m[1]));a=v.analytics?1:0;ad=v.ads?1:0}else{var r=${regions},k=c.match(/(?:^|; )fs_country=([^;]*)/),req=r==="*"?1:r==="NONE"?0:(!k||r.split(",").map(function(x){return x.trim()}).indexOf(k[1].toUpperCase())>-1)?1:0;if(!req){a=1;ad=1}}d.dataset.consentAds=ad?"1":"0";d.dataset.consentAnalytics=a?"1":"0"}catch(e){}})();`
}
