﻿namespace Core.Entities.DTO
{
    public class RegisterDTO
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }
    }
}
