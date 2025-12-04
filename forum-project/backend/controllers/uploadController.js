import qiniu from 'qiniu';
import qiniuConfig from '../config/qiniu.js';

// 生成上传凭证
export const getUploadToken = async (req, res) => {
    try {
        console.log('生成上传凭证，bucket:', qiniuConfig.bucket);
        const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);

        const options = {
            scope: qiniuConfig.bucket,
            expires: 3600, // 凭证有效期 1 小时
            returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
        };

        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);

        console.log('上传凭证生成成功，domain:', qiniuConfig.domain);

        res.json({
            success: true,
            token: uploadToken,
            domain: qiniuConfig.domain
        });
    } catch (error) {
        console.error('生成上传凭证失败:', error);
        res.status(500).json({
            success: false,
            message: '生成上传凭证失败',
            error: error.message
        });
    }
};
