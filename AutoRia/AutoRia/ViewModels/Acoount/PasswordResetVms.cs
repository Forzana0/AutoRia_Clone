namespace AutoRia.ViewModels.Account
{
    public class SendResetCodeVm
    {
        public string Email { get; set; } = null!;
    }

    public class VerifyResetCodeVm
    {
        public string Email { get; set; } = null!;
        public string Code  { get; set; } = null!;
    }

    public class ResetPasswordWithCodeVm
    {
        public string Email       { get; set; } = null!;
        public string Code        { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}
