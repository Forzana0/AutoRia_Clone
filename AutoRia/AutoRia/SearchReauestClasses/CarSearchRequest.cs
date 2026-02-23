namespace AutoRia.SearchReauestClasses
{
    public class CarSearchRequest
    {
        public string? CarType { get; set; }
        public string? Price { get; set; }
        public string? Region { get; set; }
        public string? SearchType { get; set; }
        public string? SelectedBrand { get; set; }
        public string? SelectedModel { get; set; }
        public bool VinChecked { get; set; }
        public string? Year { get; set; }
        public string? TextQuery { get; set; }
    }
}