import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SendEmailMiddleware {
    constructor(private mailerService: MailerService) { }

    sendEmail(email: string, token: string, attachmentsArray) {
        let subjectObject = {
            subjectTitle: 'Email konfirmasi "API" SejutaCita Auth',
            subjectBody: `Hallo ,<br> akun Anda yang terkait dengan email '${email}' membutuhkan verifikasi agar dapat mengakses SejutaCita Auth.<br>
            Untuk menyelesaikan proses verifikasi akun Anda, silakan copy paste token berikut:  ${token} <br>`,
        };
        try {
            let mailOptions = {
                to: email,
                subject: subjectObject.subjectTitle,
                html: subjectObject.subjectBody,
                attachments: attachmentsArray,
            };
            this.mailerService.sendMail(mailOptions)
                .then((info) => {
                    console.log('email sent', info)
                });
        } catch (error) {
            console.log('error', error);
        }
    }
}