import { Resend } from "resend";

// Singleton del cliente Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Dirección de envío por defecto
export const DEFAULT_FROM = "Ccurity <noreply@app.ccurity.com.mx>";

export { resend };
