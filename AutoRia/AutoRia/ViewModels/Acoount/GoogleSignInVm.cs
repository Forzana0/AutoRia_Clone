namespace AutoRia.ViewModels.Account
{
    public class GoogleSignInVm
    {
        public string IdToken { get; set; } = null!;   // access_token from @react-oauth/google
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
    }
}