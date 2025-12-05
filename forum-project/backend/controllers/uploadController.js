import qiniu from 'qiniu';
import qiniuConfig from '../config/qiniu.js';
import User from '../models/User.js';

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

// 上传头像（接收 Base64 数据）
export const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: '未授权'
            });
        }

        const { avatarBase64 } = req.body;
        if (!avatarBase64) {
            return res.status(400).json({
                success: false,
                message: '缺少头像数据'
            });
        }

        // 检查 base64 数据大小（限制在 500KB）
        const sizeInBytes = Buffer.byteLength(avatarBase64, 'utf8') / 1.333; // Base64 编码后的大小约为原大小的 1.33 倍
        if (sizeInBytes > 512000) { // 500KB
            return res.status(400).json({
                success: false,
                message: '头像文件过大，请重新上传（最大 500KB）'
            });
        }

        // 更新用户头像
        const user = await User.findByIdAndUpdate(
            userId,
            { avatar: avatarBase64 },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        console.log(`用户 ${userId} 的头像已更新`);

        res.json({
            success: true,
            message: '头像已更新',
            user: user
        });
    } catch (error) {
        console.error('上传头像失败:', error);
        res.status(500).json({
            success: false,
            message: '上传头像失败',
            error: error.message
        });
    }
};
