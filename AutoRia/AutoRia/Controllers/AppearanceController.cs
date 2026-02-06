using Microsoft.AspNetCore.Mvc;

namespace AutoRia.Controllers
{
    public class AppearanceController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
