export type EmailPayload={
    to:String
    subject:string
    body:string
}

export interface IEmailService{
    sendOTP(payload:EmailPayload):Promise<{ success: boolean; message?: string; }>;
}