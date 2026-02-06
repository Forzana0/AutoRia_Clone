using AutoRia.ViewModels.Pagination;

namespace AutoRia.Services.Interfaces;

public interface IPaginationService<EntityVmType, PaginationVmType> where PaginationVmType : PaginationVm
{
    Task<PageVm<EntityVmType>> GetPageAsync(PaginationVmType vm);
}
