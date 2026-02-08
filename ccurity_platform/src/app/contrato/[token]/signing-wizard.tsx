"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { submitSignatureAction } from "./actions";

type Step = "accept" | "selfie" | "ine-front" | "ine-back" | "signature" | "confirm" | "done";

const STEPS: { key: Step; label: string; icon: string }[] = [
    { key: "accept", label: "Aceptación", icon: "☑️" },
    { key: "selfie", label: "Selfie", icon: "🤳" },
    { key: "ine-front", label: "INE Frente", icon: "🪪" },
    { key: "ine-back", label: "INE Reverso", icon: "🔄" },
    { key: "signature", label: "Firma", icon: "✍️" },
    { key: "confirm", label: "Confirmar", icon: "✅" },
];

export default function SigningWizard({ token, signerName }: { token: string; signerName: string }) {
    const [step, setStep] = useState<Step>("accept");
    const [acceptedDigital, setAcceptedDigital] = useState(false);
    const [acceptedContent, setAcceptedContent] = useState(false);
    const [selfie, setSelfie] = useState<string | null>(null);
    const [ineFront, setIneFront] = useState<string | null>(null);
    const [ineBack, setIneBack] = useState<string | null>(null);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentIdx = STEPS.findIndex((s) => s.key === step);

    const handleSubmit = async () => {
        if (!selfie || !ineFront || !ineBack || !signatureData) return;

        setSubmitting(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.set("token", token);
            fd.set("selfie", selfie);
            fd.set("ineFront", ineFront);
            fd.set("ineBack", ineBack);
            fd.set("signature", signatureData);
            fd.set("acceptedDigital", String(acceptedDigital));
            fd.set("acceptedContent", String(acceptedContent));
            await submitSignatureAction(fd);
            setStep("done");
        } catch (err: any) {
            setError(err.message || "Error al firmar");
        } finally {
            setSubmitting(false);
        }
    };

    if (step === "done") {
        return (
            <div className="rounded-xl p-8 border border-green-500/30 text-center" style={{ background: "rgba(34,197,94,0.05)" }}>
                <p className="text-4xl mb-3">✅</p>
                <h2 className="text-lg font-bold text-green-400 mb-2">¡Firma registrada exitosamente!</h2>
                <p className="text-sm text-gray-400">Tus datos han sido registrados. Se notificará a la otra parte.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-6">
                {STEPS.map((s, i) => (
                    <div key={s.key} className="flex-1">
                        <div
                            className="h-1 rounded-full transition-colors"
                            style={{
                                background: i <= currentIdx ? "linear-gradient(90deg, #6c63ff, #00d4aa)" : "rgba(255,255,255,0.1)",
                            }}
                        />
                        <p className={`text-[10px] mt-1 text-center ${i <= currentIdx ? "text-gray-300" : "text-gray-600"}`}>
                            {s.icon} {s.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Step content */}
            <div className="rounded-xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
                {step === "accept" && (
                    <AcceptStep
                        acceptedDigital={acceptedDigital}
                        acceptedContent={acceptedContent}
                        onDigital={setAcceptedDigital}
                        onContent={setAcceptedContent}
                        onNext={() => setStep("selfie")}
                    />
                )}
                {step === "selfie" && (
                    <CameraStep
                        title="Toma una selfie"
                        description="Toma una foto clara de tu rostro. No se permite subir archivos."
                        icon="🤳"
                        onCapture={(data) => { setSelfie(data); setStep("ine-front"); }}
                        onBack={() => setStep("accept")}
                    />
                )}
                {step === "ine-front" && (
                    <CameraStep
                        title="Foto del frente de tu INE"
                        description="Captura la parte frontal de tu identificación oficial."
                        icon="🪪"
                        facingMode="environment"
                        onCapture={(data) => { setIneFront(data); setStep("ine-back"); }}
                        onBack={() => setStep("selfie")}
                    />
                )}
                {step === "ine-back" && (
                    <CameraStep
                        title="Foto del reverso de tu INE"
                        description="Captura la parte trasera de tu identificación oficial."
                        icon="🔄"
                        facingMode="environment"
                        onCapture={(data) => { setIneBack(data); setStep("signature"); }}
                        onBack={() => setStep("ine-front")}
                    />
                )}
                {step === "signature" && (
                    <SignatureStep
                        onDone={(data) => { setSignatureData(data); setStep("confirm"); }}
                        onBack={() => setStep("ine-back")}
                    />
                )}
                {step === "confirm" && (
                    <ConfirmStep
                        signerName={signerName}
                        selfie={selfie}
                        ineFront={ineFront}
                        ineBack={ineBack}
                        signature={signatureData}
                        submitting={submitting}
                        error={error}
                        onSubmit={handleSubmit}
                        onBack={() => setStep("signature")}
                    />
                )}
            </div>
        </div>
    );
}

/* ── Step Components ────────────────────────────── */

function AcceptStep({
    acceptedDigital, acceptedContent, onDigital, onContent, onNext,
}: {
    acceptedDigital: boolean; acceptedContent: boolean;
    onDigital: (v: boolean) => void; onContent: (v: boolean) => void;
    onNext: () => void;
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">☑️ Aceptación de términos</h2>
            <p className="text-sm text-gray-400">Antes de firmar, debes aceptar las siguientes condiciones:</p>

            <label className="flex items-start gap-3 p-4 rounded-lg border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
                <input
                    type="checkbox"
                    checked={acceptedDigital}
                    onChange={(e) => onDigital(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded accent-purple-500"
                />
                <div>
                    <p className="text-sm text-white font-medium">Acepto utilizar medios digitales para la firma</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Confirmo que deseo utilizar medios electrónicos y digitales para la firma de este contrato,
                        con pleno valor legal conforme a la legislación aplicable.
                    </p>
                </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-lg border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
                <input
                    type="checkbox"
                    checked={acceptedContent}
                    onChange={(e) => onContent(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded accent-purple-500"
                />
                <div>
                    <p className="text-sm text-white font-medium">He leído y acepto el contenido del contrato</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Confirmo que he leído completamente el contenido del presente contrato y estoy de acuerdo
                        con todos sus términos y condiciones.
                    </p>
                </div>
            </label>

            <button
                onClick={onNext}
                disabled={!acceptedDigital || !acceptedContent}
                className="w-full py-3 rounded-lg text-white font-medium text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                    background: acceptedDigital && acceptedContent
                        ? "linear-gradient(90deg, #6c63ff, #00d4aa)"
                        : "rgba(255,255,255,0.1)",
                }}
            >
                Continuar →
            </button>
        </div>
    );
}

function CameraStep({
    title, description, icon, facingMode = "user",
    onCapture, onBack,
}: {
    title: string; description: string; icon: string;
    facingMode?: "user" | "environment";
    onCapture: (data: string) => void;
    onBack: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streaming, setStreaming] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStreaming(true);
            }
        } catch {
            alert("No se pudo acceder a la cámara. Asegúrate de dar permiso.");
        }
    }, [facingMode]);

    const stopCamera = useCallback(() => {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach((t) => t.stop());
        setStreaming(false);
    }, []);

    const capture = useCallback(() => {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
        const data = canvas.toDataURL("image/jpeg", 0.9);
        setPreview(data);
        stopCamera();
    }, [stopCamera]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">{icon} {title}</h2>
            <p className="text-sm text-gray-400">{description}</p>

            {preview ? (
                <div className="space-y-3">
                    <img src={preview} alt="Captura" className="w-full rounded-lg border border-white/10" />
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setPreview(null); startCamera(); }}
                            className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/5 cursor-pointer"
                        >
                            🔄 Repetir
                        </button>
                        <button
                            onClick={() => onCapture(preview)}
                            className="flex-1 py-2 rounded-lg text-white font-medium text-sm cursor-pointer"
                            style={{ background: "linear-gradient(90deg, #6c63ff, #00d4aa)" }}
                        >
                            ✅ Usar esta foto
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black aspect-video">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        {!streaming && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                                Iniciando cámara...
                            </div>
                        )}
                    </div>
                    <button
                        onClick={capture}
                        disabled={!streaming}
                        className="w-full py-3 rounded-lg text-white font-medium text-sm cursor-pointer disabled:opacity-30"
                        style={{ background: "linear-gradient(90deg, #6c63ff, #00d4aa)" }}
                    >
                        📸 Capturar
                    </button>
                </div>
            )}

            <button
                onClick={() => { stopCamera(); onBack(); }}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 cursor-pointer"
            >
                ← Regresar
            </button>
        </div>
    );
}

function SignatureStep({
    onDone, onBack,
}: {
    onDone: (data: string) => void;
    onBack: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    const getCtx = () => canvasRef.current?.getContext("2d");

    const getPos = (e: React.TouchEvent | React.MouseEvent): { x: number; y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        if ("touches" in e) {
            const touch = e.touches[0];
            if (!touch) return null;
            return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        }
        return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    };

    const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        const ctx = getCtx();
        const pos = getPos(e);
        if (!ctx || !pos) return;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setDrawing(true);
    };

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!drawing) return;
        const ctx = getCtx();
        const pos = getPos(e);
        if (!ctx || !pos) return;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#ffffff";
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        setHasDrawn(true);
    };

    const endDraw = () => setDrawing(false);

    const clear = () => {
        const ctx = getCtx();
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const done = () => {
        if (!canvasRef.current) return;
        const data = canvasRef.current.toDataURL("image/png");
        onDone(data);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">✍️ Firma autógrafa</h2>
            <p className="text-sm text-gray-400">Firma con tu dedo o mouse en el área de abajo.</p>

            <div className="rounded-lg border border-white/10 overflow-hidden" style={{ touchAction: "none" }}>
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full bg-black/50 cursor-crosshair"
                    style={{ height: 200 }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={clear}
                    className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/5 cursor-pointer"
                >
                    🗑 Limpiar
                </button>
                <button
                    onClick={done}
                    disabled={!hasDrawn}
                    className="flex-1 py-2 rounded-lg text-white font-medium text-sm cursor-pointer disabled:opacity-30"
                    style={{ background: hasDrawn ? "linear-gradient(90deg, #6c63ff, #00d4aa)" : "rgba(255,255,255,0.1)" }}
                >
                    Continuar →
                </button>
            </div>

            <button onClick={onBack} className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 cursor-pointer">
                ← Regresar
            </button>
        </div>
    );
}

function ConfirmStep({
    signerName, selfie, ineFront, ineBack, signature, submitting, error, onSubmit, onBack,
}: {
    signerName: string;
    selfie: string | null;
    ineFront: string | null;
    ineBack: string | null;
    signature: string | null;
    submitting: boolean;
    error: string | null;
    onSubmit: () => void;
    onBack: () => void;
}) {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">✅ Confirmar firma</h2>
            <p className="text-sm text-gray-400">Revisa tus datos antes de enviar. Una vez enviado no podrás modificarlos.</p>

            <div className="grid grid-cols-2 gap-3">
                {selfie && (
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-500">Selfie</p>
                        <img src={selfie} alt="Selfie" className="w-full rounded-lg border border-white/10" />
                    </div>
                )}
                {ineFront && (
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-500">INE Frente</p>
                        <img src={ineFront} alt="INE Frente" className="w-full rounded-lg border border-white/10" />
                    </div>
                )}
                {ineBack && (
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-500">INE Reverso</p>
                        <img src={ineBack} alt="INE Reverso" className="w-full rounded-lg border border-white/10" />
                    </div>
                )}
                {signature && (
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-500">Firma autógrafa</p>
                        <img src={signature} alt="Firma" className="w-full rounded-lg border border-white/10 bg-black/30" />
                    </div>
                )}
            </div>

            <div className="rounded-lg border border-white/10 p-3 text-center">
                <p className="text-sm text-white font-medium">{signerName}</p>
                <p className="text-xs text-gray-500">Firmante</p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/30 p-3 text-sm text-red-400 bg-red-500/5">
                    ❌ {error}
                </div>
            )}

            <button
                onClick={onSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-lg text-white font-bold text-sm cursor-pointer disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(90deg, #6c63ff, #00d4aa)" }}
            >
                {submitting ? "Enviando firma..." : "🖊 Firmar contrato"}
            </button>

            <button onClick={onBack} disabled={submitting} className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 cursor-pointer">
                ← Regresar
            </button>
        </div>
    );
}
