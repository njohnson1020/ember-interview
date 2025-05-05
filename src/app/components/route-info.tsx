import { RouteStop } from '@/app/lib/transform-trip-info';
import { StatusLegend } from './status-legend';

export const RouteInfo = ({
  stops,
  onSelectStop,
}: {
  stops: RouteStop[];
  onSelectStop: (stop: RouteStop) => void;
}) => (
  <div className="bg-white text-gray-600 p-4 rounded-lg shadow-lg">
    <h2 className="text-lg font-semibold mb-2">Route Information</h2>
    <p className="text-gray-600 mb-2">Click on any stop to see details</p>

    <div className="mt-4">
      <h3 className="font-semibold mb-2">All Stops:</h3>
      <ul className="space-y-2" data-testid="stops-list">
        {stops.map((stop) => (
          <li key={stop.stopNumber} className="flex items-center">
            <div
              className="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white"
              style={{ backgroundColor: stop.busStatus.color }}
            >
              {stop.stopNumber}
            </div>
            <button
              onClick={() => onSelectStop(stop)}
              className="text-left hover:text-blue-600"
              data-testid={`stop-item-${stop.stopNumber}`}
            >
              {stop.name}
              {stop.is_next_stop && <strong> - Next Stop</strong>}
            </button>
          </li>
        ))}
      </ul>
    </div>

    <StatusLegend />
  </div>
);
