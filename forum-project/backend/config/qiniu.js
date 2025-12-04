// 七牛云配置
import qiniu from 'qiniu';

const config = {
    accessKey: 'pq0cTJhSR4C6Y2BwDs64bYOnad0Wj8jQq-cSYlZu',
    secretKey: 'CN-welV4NEXv6DpuGEqwbEls0CCpqYMRMnPQsiK9',
    bucket: 'mypicture21', // 你的存储空间名称
    domain: 'http://t6qsnqnup.sabkt.gdipper.com', // 你的 CDN 域名
    zone: qiniu.zone.Zone_as0 // 新加坡区域
};

export default config;
