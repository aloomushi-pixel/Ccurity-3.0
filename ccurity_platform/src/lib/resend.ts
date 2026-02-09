import { Resend } from "resend";

// Cliente Resend lazy-initialized (evita errores en build si no hay API key)
let _resend: Resend | null = null;

export function getResend(): Resend {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

// Mantener export como alias por compatibilidad
export const resend = {
    get emails() {
        return getResend().emails;
    },
};

// Dirección de envío por defecto
export const DEFAULT_FROM = "Ccurity <noreply@app.ccurity.com.mx>";
