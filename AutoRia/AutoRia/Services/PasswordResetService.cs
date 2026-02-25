using System.Collections.Concurrent;

namespace AutoRia.Services
{
    /// <summary>
    /// Зберігає коди скидання паролю в пам'яті (діють 10 хвилин)
    /// </summary>
    public class PasswordResetService
    {
        private static readonly ConcurrentDictionary<string, (string Code, DateTime Expiry)> _codes = new();

        public string GenerateCode(string email)
        {
            var code = new Random().Next(100000, 999999).ToString();
            _codes[email.ToLower()] = (code, DateTime.UtcNow.AddMinutes(10));
            return code;
        }

        public bool VerifyCode(string email, string code)
        {
            var key = email.ToLower();
            if (!_codes.TryGetValue(key, out var entry)) return false;
            if (DateTime.UtcNow > entry.Expiry) { _codes.TryRemove(key, out _); return false; }
            return entry.Code == code;
        }

        public void RemoveCode(string email)
        {
            _codes.TryRemove(email.ToLower(), out _);
        }
    }
}
