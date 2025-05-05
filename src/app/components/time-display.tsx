import { formatDate, formatTime } from '@/app/utils/date-utils';

export const TimeDisplay = ({
  title,
  scheduleData,
  busStatus,
}: {
  title: string;
  scheduleData: ScheduledTime;
  busStatus: BusStatus;
}) => (
  <div className="mt-3">
    <h3 className="font-semibold">{title}:</h3>
    <div className="flex justify-between items-center mt-1">
      <div>
        <p>Date: {formatDate(scheduleData.scheduled)}</p>
        {scheduleData.actual ? (
          <p>
            {title === 'Arrival Times' ? 'Arrived' : 'Departed'}:{' '}
            {formatTime(scheduleData.actual)}
          </p>
        ) : (
          <>
            <p>Scheduled: {formatTime(scheduleData.scheduled)}</p>
            <p>
              Estimated:{' '}
              {scheduleData.estimated
                ? formatTime(scheduleData.estimated)
                : 'TBD'}
            </p>
          </>
        )}
      </div>

      <div
        className="px-3 py-1 rounded-full text-white text-sm font-medium"
        style={{ backgroundColor: busStatus.color }}
        data-testid="status-indicator"
      >
        {busStatus.description}
      </div>
    </div>
  </div>
);
