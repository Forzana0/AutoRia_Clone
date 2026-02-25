using System.Net;
using System.Net.Mail;

namespace AutoRia.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendResetCodeAsync(string toEmail, string code)
        {
            var smtpHost   = _config["Email:SmtpHost"]   ?? "smtp.gmail.com";
            var smtpPort   = int.Parse(_config["Email:SmtpPort"] ?? "587");
            var smtpUser   = _config["Email:User"]       ?? throw new Exception("Email:User not configured");
            var smtpPass   = _config["Email:Password"]   ?? throw new Exception("Email:Password not configured");
            var fromName   = _config["Email:FromName"]   ?? "Autly";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true,
            };

            var msg = new MailMessage
            {
                From = new MailAddress(smtpUser, fromName),
                Subject = "Відновлення паролю — Autly",
                IsBodyHtml = true,
                Body = $@"
                    <div style='font-family:sans-serif;max-width:480px;margin:0 auto'>
                        <h2 style='color:#1e2a4a'>Відновлення паролю</h2>
                        <p>Ваш код для скидання паролю:</p>
                        <div style='font-size:36px;font-weight:bold;letter-spacing:8px;
                                    background:#f0f2f9;padding:16px 24px;border-radius:12px;
                                    text-align:center;color:#1e2a4a;margin:16px 0'>
                            {code}
                        </div>
                        <p style='color:#6b7280;font-size:13px'>
                            Код дійсний 10 хвилин. Якщо ви не запитували скидання паролю — проігноруйте цей лист.
                        </p>
                        <p style='color:#9ca3af;font-size:12px'>— Команда Autly</p>
                    </div>"
            };
            msg.To.Add(toEmail);

            await client.SendMailAsync(msg);
        }
    }
}
