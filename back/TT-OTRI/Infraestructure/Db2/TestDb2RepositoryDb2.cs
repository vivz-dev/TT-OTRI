using IBM.Data.Db2;

namespace TT_OTRI.Infrastructure.Db2
{
    public class TestDb2RepositoryDb2
    {
        private readonly DB2Connection _con; // o string y crear conexiones por método
        public TestDb2RepositoryDb2(DB2Connection con) => _con = con;

        public async Task<List<string>> GetAccionesAsync()
        {
            var results = new List<string>();
            if (_con.State != System.Data.ConnectionState.Open)
                await _con.OpenAsync();

            using var cmd = _con.CreateCommand();
            cmd.CommandText = "SELECT CAST(IDOTRITTACCION AS VARCHAR(50)) FROM SOTRI.T_OTRI_TT_ACCION FETCH FIRST 5 ROWS ONLY";
            using var rd = await cmd.ExecuteReaderAsync();
            while (await rd.ReadAsync())
                results.Add(rd.GetString(0));
            return results;
        }

        public async Task<List<string>> GetRolesPermisoAsync()
        {
            var results = new List<string>();
            if (_con.State != System.Data.ConnectionState.Open)
                await _con.OpenAsync();

            using var cmd = _con.CreateCommand();
            cmd.CommandText = "SELECT CAST(IDOTRTTROLPERMISO AS VARCHAR(50)) FROM SOTRI.T_OTRI_TT_ROL_PERMISO FETCH FIRST 5 ROWS ONLY";
            using var rd = await cmd.ExecuteReaderAsync();
            while (await rd.ReadAsync())
                results.Add(rd.GetString(0));
            return results;
        }
    }
}