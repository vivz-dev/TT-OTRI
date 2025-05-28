var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer(); // <-- Para Swagger
builder.Services.AddSwaggerGen();           // <-- Para Swagger

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // Puedes pasar opciones aquí si deseas
}

// Habilitar enrutamiento de controladores
app.UseRouting();
app.UseAuthorization(); // Por si activas autenticación más adelante

app.MapControllers();

app.Run();