import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimeDisplay } from './time-display';
import '@testing-library/jest-dom/vitest';

describe('TimeDisplay', () => {
  const mockScheduledTime = {
    scheduled: '2025-05-05T10:00:00Z',
  };

  const mockBusStatus = {
    status: 'on-time',
    color: '#4CAF50',
    description: 'On Time',
  } as BusStatus;

  it('renders the title correctly', () => {
    render(
      <TimeDisplay
        title="Test Times"
        scheduleData={mockScheduledTime}
        busStatus={mockBusStatus}
      />
    );
    expect(screen.queryByText('Test Times:')).toBeDefined();
  });

  it('displays scheduled date', () => {
    render(
      <TimeDisplay
        title="Arrival Times"
        scheduleData={mockScheduledTime}
        busStatus={mockBusStatus}
      />
    );
    expect(screen.queryByText('5/5/2025')).toBeDefined();
  });

  it('shows scheduled and estimated times when no actual time', () => {
    render(
      <TimeDisplay
        title="Arrival Times"
        scheduleData={mockScheduledTime}
        busStatus={mockBusStatus}
      />
    );
    expect(screen.queryByText(/Scheduled:/)).toBeDefined();
    expect(screen.queryByText(/Estimated:/)).toBeDefined();
  });

  it('shows actual arrival time when available', () => {
    const actualTimeData = {
      ...mockScheduledTime,
      actual: '2025-05-05T10:05:00Z',
    };

    render(
      <TimeDisplay
        title="Arrival Times"
        scheduleData={actualTimeData}
        busStatus={mockBusStatus}
      />
    );
    expect(screen.queryByText(/Arrived:/)).toBeDefined();
  });

  it('shows actual departure time when available', () => {
    const actualTimeData = {
      ...mockScheduledTime,
      actual: '2025-05-05T10:05:00Z',
    };

    render(
      <TimeDisplay
        title="Departure Times"
        scheduleData={actualTimeData}
        busStatus={mockBusStatus}
      />
    );
    expect(screen.queryByText(/Departed:/)).toBeDefined();
  });

  it('displays estimated time when available', () => {
    const estimatedTimeData = {
      ...mockScheduledTime,
      estimated: '2025-05-05T10:15:00Z',
    };

    render(
      <TimeDisplay
        title="Arrival Times"
        scheduleData={estimatedTimeData}
        busStatus={mockBusStatus}
      />
    );
    expect(screen.queryByText(/Estimated:/)).toBeDefined();
  });

  it('displays status indicator with correct color and description', () => {
    render(
      <TimeDisplay
        title="Arrival Times"
        scheduleData={mockScheduledTime}
        busStatus={mockBusStatus}
      />
    );

    const statusIndicator = screen.getByTestId('status-indicator');
    expect(statusIndicator).toHaveStyle({ backgroundColor: '#4CAF50' });
    expect(statusIndicator).toHaveTextContent('On Time');
  });

  it('handles delayed status correctly', () => {
    const delayedStatus = {
      status: 'delayed',
      color: '#F44336',
      description: 'Delayed',
    } as BusStatus;

    render(
      <TimeDisplay
        title="Arrival Times"
        scheduleData={mockScheduledTime}
        busStatus={delayedStatus}
      />
    );

    const statusIndicator = screen.getByTestId('status-indicator');
    expect(statusIndicator).toHaveStyle({ backgroundColor: '#F44336' });
    expect(statusIndicator).toHaveTextContent('Delayed');
  });

  it('maintains layout structure', () => {
    render(
      <TimeDisplay
        title="Arrival Times"
        scheduleData={mockScheduledTime}
        busStatus={mockBusStatus}
      />
    );

    const container = screen.queryByText('Arrival Times:')?.closest('div');
    expect(container).toHaveClass('mt-3');
    expect(container?.children[1]).toHaveClass(
      'flex',
      'justify-between',
      'items-center'
    );
  });
});
