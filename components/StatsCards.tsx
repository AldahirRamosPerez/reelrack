'use client';
interface StatsCardsProps {
  stats: {
    total: number;
    avgRating: number;
    topDecade: string;
    completeness: {
      overviewpct: string | number;
      posterpct: string | number;
      directorpct: string | number;
      castpct: string | number;
    };
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  // Valores seguros
  const overview = parseFloat(String(stats.completeness?.overviewpct || 0));
  const poster = parseFloat(String(stats.completeness?.posterpct || 0));
  const director = parseFloat(String(stats.completeness?.directorpct || 0));
  const cast = parseFloat(String(stats.completeness?.castpct || 0));
  const avgComp = Math.round((overview + poster + director + cast) / 4);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-center">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        <i className="fas fa-database text-2xl text-blue-500"></i>
        <p className="text-2xl font-bold">{stats.total}</p>
        <p className="text-xs text-gray-500">Obras maestras</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        <i className="fas fa-star text-2xl text-yellow-500"></i>
        <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
        <p className="text-xs text-gray-500">Valoración media</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        <i className="fas fa-chart-line text-2xl text-green-500"></i>
        <p className="text-md font-semibold">{stats.topDecade}</p>
        <p className="text-xs text-gray-500">Época dorada</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        <i className="fas fa-percent text-2xl text-purple-500"></i>
        <p className="text-2xl font-bold">{avgComp}%</p>
        <p className="text-xs text-gray-500">Riqueza visual</p>
      </div>
    </div>
  );
}