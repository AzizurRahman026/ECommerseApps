﻿using Core.Entities;

namespace Core.Interface
{
    public interface IProductRepository
    {
        
        string Root();
        Task<List<Product>?> GetProducts(string? brand, string? type, string? sort);
        Task<Product?> GetProductById(string id);
        Task<IReadOnlyList<string>> GetBrands();
        Task<IReadOnlyList<string>> GetTypes();
        Task<string> AddProduct(Product prod);
        Task<int> UpdateProduct(string id, Product prod);
        Task<bool> DeleteProduct(string id);
        Task<bool> ExistProduct(string id);
    }
}
