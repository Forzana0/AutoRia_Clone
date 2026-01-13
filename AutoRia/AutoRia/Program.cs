using AutoRia.Data.Context;
using AutoRia.Data.Entities.Identity;
using AutoRia.Data.Seed;
using AutoRia.Services;
using AutoRia.Services.ControllerServices;
using AutoRia.Services.ControllerServices.Interfaces;
using AutoRia.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbAutoRiaContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// Identity
builder.Services
    .AddIdentity<UserEntity, RoleEntity>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequiredLength = 6;
        options.Password.RequireNonAlphanumeric = false;
        options.User.RequireUniqueEmail = true;
        options.SignIn.RequireConfirmedEmail = true;
    })
    .AddEntityFrameworkStores<AppDbAutoRiaContext>()
    .AddDefaultTokenProviders();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
    };
});

// Services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAccountsControllerService, AccountsControllerService>();

// HTTP Context
builder.Services.AddHttpContextAccessor();

builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

await IdentitySeeder.SeedAsync(app.Services);

app.UseCors("AllowReact");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();