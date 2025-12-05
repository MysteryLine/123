'use client';

import React, { useRef, useState, useEffect } from 'react';

interface AvatarEditorProps {
    onComplete: (avatarBase64: string) => void;
    onCancel: () => void;
}

type EditorMode = 'draw' | 'crop';

export default function AvatarEditor({ onComplete, onCancel }: AvatarEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<EditorMode>('draw');
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [drawingData, setDrawingData] = useState<string>('');

    // 裁剪相关状态
    const cropCanvasRef = useRef<HTMLCanvasElement>(null);
    const [cropX, setCropX] = useState(150);
    const [cropY, setCropY] = useState(150);
    const [cropRadius, setCropRadius] = useState(80);
    const [isDraggingCircle, setIsDraggingCircle] = useState(false);
    const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragStartY, setDragStartY] = useState(0);

    // 初始化绘画画布
    useEffect(() => {
        if (mode === 'draw' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 1;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [mode]);

    // 初始化裁剪画布
    useEffect(() => {
        if (mode === 'crop' && cropCanvasRef.current && drawingData) {
            const canvas = cropCanvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const img = new Image();
                img.onload = () => {
                    ctx.fillStyle = '#f5f5f5';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    drawCropCircle(ctx, canvas.width, canvas.height);
                };
                img.src = drawingData;
            }
        }
    }, [mode, drawingData]);

    // 绘制裁剪圆形
    const drawCropCircle = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number
    ) => {
        // 清除并重新绘制
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0);

            // 绘制暗化的外部区域
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(cropX, cropY, cropRadius, 0, Math.PI * 2);
            ctx.fill('evenodd');

            // 绘制圆形边界
            ctx.strokeStyle = '#4a90e2';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cropX, cropY, cropRadius, 0, Math.PI * 2);
            ctx.stroke();

            // 绘制控制点
            drawControlPoints(ctx);
        };
        img.src = drawingData;
    };

    const drawControlPoints = (ctx: CanvasRenderingContext2D) => {
        const points = [
            { x: cropX, y: cropY - cropRadius }, // top
            { x: cropX + cropRadius, y: cropY }, // right
            { x: cropX, y: cropY + cropRadius }, // bottom
            { x: cropX - cropRadius, y: cropY }, // left
        ];

        points.forEach((point) => {
            ctx.fillStyle = '#4a90e2';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    };

    // 绘画事件处理
  const handleDrawStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw') return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };    const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || mode !== 'draw') return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
    };

    const handleDrawEnd = () => {
        setIsDrawing(false);
        if (canvasRef.current) {
            setDrawingData(canvasRef.current.toDataURL());
        }
    };

    // 清除绘画
    const handleClearDraw = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 1;
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                setDrawingData('');
            }
        }
    };

    // 进入裁剪模式
    const handleToCrop = () => {
        if (canvasRef.current) {
            setDrawingData(canvasRef.current.toDataURL());
            setMode('crop');
        }
    };

    // 裁剪事件处理
    const handleCropMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mode !== 'crop') return;
        const canvas = cropCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const distToCenter = Math.sqrt((x - cropX) ** 2 + (y - cropY) ** 2);

        // 检查是否点击在圆形内部（移动）
        if (distToCenter < cropRadius - 10) {
            setIsDraggingCircle(true);
            setDragMode('move');
            setDragStartX(x - cropX);
            setDragStartY(y - cropY);
        } else if (distToCenter <= cropRadius + 10) {
            // 检查是否点击在圆形边界附近（调整大小）
            setIsDraggingCircle(true);
            setDragMode('resize');
            setDragStartX(x);
            setDragStartY(y);
        }
    };

    const handleCropMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDraggingCircle || mode !== 'crop' || !dragMode) return;
        const canvas = cropCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (dragMode === 'move') {
            // 移动圆形
            const newX = Math.max(cropRadius, Math.min(canvas.width - cropRadius, x - dragStartX));
            const newY = Math.max(cropRadius, Math.min(canvas.height - cropRadius, y - dragStartY));
            setCropX(newX);
            setCropY(newY);
        } else if (dragMode === 'resize') {
            // 调整大小
            const dx = x - dragStartX;
            const dy = y - dragStartY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const newRadius = Math.max(40, Math.min(150, cropRadius + distance * 0.3));
            setCropRadius(newRadius);
            setDragStartX(x);
            setDragStartY(y);
        }

        // 重绘
        if (cropCanvasRef.current) {
            drawCropCircle(cropCanvasRef.current.getContext('2d')!, canvas.width, canvas.height);
        }
    };

    const handleCropMouseUp = () => {
        setIsDraggingCircle(false);
        setDragMode(null);
    };

    // 完成裁剪
    const handleCompleteCrop = () => {
        const canvas = document.createElement('canvas');
        const size = cropRadius * 2;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            const img = new Image();
            img.onload = () => {
                // 绘制圆形
                ctx.beginPath();
                ctx.arc(cropRadius, cropRadius, cropRadius, 0, Math.PI * 2);
                ctx.clip();

                // 绘制裁剪后的图片
                const sourceX = cropX - cropRadius;
                const sourceY = cropY - cropRadius;
                ctx.drawImage(
                    img,
                    -sourceX,
                    -sourceY,
                    300,
                    300
                );

                const avatarBase64 = canvas.toDataURL('image/png', 0.9);
                onComplete(avatarBase64);
            };
            img.src = drawingData;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        {mode === 'draw' ? '✏️ 绘制头像' : '🎯 裁剪头像'}
                    </h2>
                    <button onClick={onCancel} style={styles.closeBtn}>
                        ✕
                    </button>
                </div>

                {mode === 'draw' ? (
                    <div style={styles.drawMode}>
                        {/* 控制条 */}
                        <div style={styles.controls}>
                            <div style={styles.controlGroup}>
                                <label style={styles.label}>颜色:</label>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    style={styles.colorInput}
                                />
                                <span style={styles.colorValue}>{color}</span>
                            </div>

                            <div style={styles.controlGroup}>
                                <label style={styles.label}>笔刷粗细: {brushSize}px</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                    style={styles.slider}
                                />
                            </div>
                        </div>

                        {/* 绘画画布 */}
                        <canvas
                            ref={canvasRef}
                            width={300}
                            height={300}
                            onMouseDown={handleDrawStart}
                            onMouseMove={handleDrawMove}
                            onMouseUp={handleDrawEnd}
                            onMouseLeave={handleDrawEnd}
                            style={styles.canvas}
                        />

                        {/* 按钮 */}
                        <div style={styles.buttonGroup}>
                            <button onClick={handleClearDraw} style={{ ...styles.btn, ...styles.btnSecondary }}>
                                🗑️ 清除
                            </button>
                            <button onClick={handleToCrop} style={{ ...styles.btn, ...styles.btnPrimary }}>
                                ➡️ 下一步（裁剪）
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={styles.cropMode}>
                        {/* 裁剪画布 */}
                        <canvas
                            ref={cropCanvasRef}
                            width={300}
                            height={300}
                            onMouseDown={handleCropMouseDown}
                            onMouseMove={handleCropMouseMove}
                            onMouseUp={handleCropMouseUp}
                            onMouseLeave={handleCropMouseUp}
                            style={styles.canvas}
                        />

                        <div style={styles.cropInfo}>
                            <p style={styles.infoText}>
                                💡 在圆形内部拖动移动，在边界拖动调整大小
                            </p>
                        </div>

                        {/* 按钮 */}
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={() => setMode('draw')}
                                style={{ ...styles.btn, ...styles.btnSecondary }}
                            >
                                ⬅️ 返回绘制
                            </button>
                            <button
                                onClick={handleCompleteCrop}
                                style={{ ...styles.btn, ...styles.btnPrimary }}
                            >
                                ✅ 确认头像
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    title: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#999',
        padding: '0',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawMode: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    cropMode: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    controls: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        backgroundColor: '#f9f9f9',
        padding: '12px',
        borderRadius: '8px',
    },
    controlGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        minWidth: '200px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#666',
        whiteSpace: 'nowrap',
    },
    colorInput: {
        width: '40px',
        height: '32px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    colorValue: {
        fontSize: '12px',
        color: '#999',
        fontFamily: 'monospace',
    },
    slider: {
        flex: 1,
        minWidth: '80px',
    },
    canvas: {
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        cursor: 'crosshair',
        display: 'block',
        width: '300px',
        height: '300px',
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
    },
    btn: {
        flex: 1,
        padding: '10px 16px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    btnPrimary: {
        backgroundColor: '#4a90e2',
        color: '#ffffff',
    },
    btnSecondary: {
        backgroundColor: '#f0f0f0',
        color: '#333',
    },
    cropInfo: {
        backgroundColor: '#f0f7ff',
        border: '1px solid #d0e8ff',
        borderRadius: '8px',
        padding: '12px',
    },
    infoText: {
        margin: '0',
        fontSize: '13px',
        color: '#0066cc',
    },
};
