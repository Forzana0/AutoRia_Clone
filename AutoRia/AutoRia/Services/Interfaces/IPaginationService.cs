using AutoRia.ViewModels.Pagination;
using AutoRia.ViewModels.Pagination;

namespace WebBack.Services.Interfaces;

public interface IPaginationService<EntityVmType, PaginationVmType> where PaginationVmType : PaginationVm
{
    Task<PageVm<EntityVmType>> GetPageAsync(PaginationVmType vm);
}
