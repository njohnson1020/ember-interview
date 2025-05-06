import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StopDetail } from './stop-detail';
import '@testing-library/jest-dom/vitest';

describe('StopDetail', () => {
  const mockStop: RouteStop = {
    stopNumber: 1,
    name: 'Test Stop',
    location: { latitude: 51.5074, longitude: -0.1278 },
    arrival: {
      scheduled: '2025-05-05T10:00:00Z',
    },
    departure: {
      scheduled: '2025-05-05T10:05:00Z',
    },
    busStatus: {
      status: 'on-time',
      color: '#4CAF50',
      description: 'On Time',
    },
    allow_boarding: true,
    allow_drop_off: true,
    is_next_stop: false,
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stop name', () => {
    render(<StopDetail stop={mockStop} onClose={mockOnClose} />);
    expect(screen.queryByText('Test Stop')).toBeDefined();
  });

  it('renders TimeDisplay component with correct props', () => {
    render(<StopDetail stop={mockStop} onClose={mockOnClose} />);
    expect(screen.queryByText('Arrival')).toBeDefined();
  });

  it('shows boarding status when boarding is allowed', () => {
    render(<StopDetail stop={mockStop} onClose={mockOnClose} />);
    expect(screen.queryByText('Boarding Allowed')).toBeDefined();
  });

  it('hides boarding status when boarding is not allowed', () => {
    const stopWithoutBoarding = {
      ...mockStop,
      allow_boarding: false,
    };
    render(<StopDetail stop={stopWithoutBoarding} onClose={mockOnClose} />);
    expect(screen.queryByText('Boarding Allowed')).toBeNull();
  });

  it('shows drop off status when drop off is allowed', () => {
    render(<StopDetail stop={mockStop} onClose={mockOnClose} />);
    expect(screen.queryByText('Drop Off Allowed')).toBeDefined();
  });

  it('hides drop off status when drop off is not allowed', () => {
    const stopWithoutDropOff = {
      ...mockStop,
      allow_drop_off: false,
    };
    render(<StopDetail stop={stopWithoutDropOff} onClose={mockOnClose} />);
    expect(screen.queryByText('Drop Off Allowed')).toBeNull();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<StopDetail stop={mockStop} onClose={mockOnClose} />);

    const closeButton = screen.getByTestId('close-stop-detail');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with all options disabled', () => {
    const stopWithNoOptions = {
      ...mockStop,
      allow_boarding: false,
      allow_drop_off: false,
    };
    render(<StopDetail stop={stopWithNoOptions} onClose={mockOnClose} />);

    expect(screen.queryByText('Boarding Allowed')).toBeNull();
    expect(screen.queryByText('Drop Off Allowed')).toBeNull();
  });

  it('displays the Options section header', () => {
    render(<StopDetail stop={mockStop} onClose={mockOnClose} />);
    expect(screen.queryByText('Options:')).toBeDefined();
  });

  it('has a close button with correct styling', () => {
    render(<StopDetail stop={mockStop} onClose={mockOnClose} />);
    const closeButton = screen.getByTestId('close-stop-detail');

    expect(closeButton).toBeDefined();
    expect(closeButton).toHaveClass(
      'w-full',
      'py-2',
      'bg-gray-200',
      'rounded-lg',
      'text-gray-800',
      'transition-colors'
    );
  });
});
