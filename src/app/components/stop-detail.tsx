import { TimeDisplay } from './time-display';

export const StopDetail = ({
  stop,
  onClose,
}: {
  stop: RouteStop;
  onClose: () => void;
}) => (
  <div className="bg-white text-gray-600 p-4 rounded-lg shadow-lg">
    <h2 className="text-xl font-bold mb-2">{stop.name}</h2>

    <div className="mb-4">
      <TimeDisplay
        title="Arrival Times"
        scheduleData={stop.arrival}
        busStatus={stop.busStatus}
      />
      <TimeDisplay
        title="Departure Times"
        scheduleData={stop.departure}
        busStatus={stop.busStatus}
      />

      <div className="mt-3">
        <h3 className="font-semibold">Options:</h3>
        <div className="flex flex-wrap gap-1 mt-1">
          {stop.allow_boarding && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              Boarding Allowed
            </span>
          )}
          {stop.allow_drop_off && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              Drop Off Allowed
            </span>
          )}
        </div>
      </div>
    </div>

    <button
      onClick={onClose}
      className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors"
      data-testid="close-stop-detail"
    >
      Close
    </button>
  </div>
);
