import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouteInfo } from './route-info';

describe('RouteInfo', () => {
  const mockStops: RouteStop[] = [
    {
      stopNumber: 1,
      name: 'First Stop',
      location: { latitude: 51.5074, longitude: -0.1278 },
      arrival: { scheduled: '2025-05-05T10:00:00Z' },
      departure: { scheduled: '2025-05-05T10:05:00Z' },
      busStatus: {
        status: 'on-time',
        color: '#4CAF50',
        description: 'On Time',
      },
      allow_boarding: true,
      allow_drop_off: true,
      is_next_stop: true,
    },
    {
      stopNumber: 2,
      name: 'Second Stop',
      location: { latitude: 51.5074, longitude: -0.1278 },
      arrival: { scheduled: '2025-05-05T10:15:00Z' },
      departure: { scheduled: '2025-05-05T10:20:00Z' },
      busStatus: {
        status: 'delayed',
        color: '#F44336',
        description: 'Delayed',
      },
      allow_boarding: true,
      allow_drop_off: true,
      is_next_stop: false,
    },
  ];

  const mockOnSelectStop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders route information header', () => {
    render(<RouteInfo stops={mockStops} onSelectStop={mockOnSelectStop} />);

    expect(screen.queryByText('Route Information')).toBeDefined();
    expect(
      screen.queryByText('Click on any stop to see details')
    ).toBeDefined();
  });

  it('renders all stops in the list', () => {
    render(<RouteInfo stops={mockStops} onSelectStop={mockOnSelectStop} />);

    const stopsList = screen.getByTestId('stops-list');
    expect(stopsList.children.length).toBe(mockStops.length);
  });

  it('displays stop numbers and names correctly', () => {
    render(<RouteInfo stops={mockStops} onSelectStop={mockOnSelectStop} />);

    mockStops.forEach((stop) => {
      expect(screen.queryByText(stop.name)).toBeDefined();
      expect(screen.queryByText(stop.stopNumber.toString())).toBeDefined();
    });
  });

  it('highlights the next stop', () => {
    render(<RouteInfo stops={mockStops} onSelectStop={mockOnSelectStop} />);

    const nextStop = mockStops.find((stop) => stop.is_next_stop);
    expect(screen.queryByText('- Next Stop')).toBeDefined();
    expect(screen.queryByText(nextStop!.name)).toBeDefined();
  });

  it('calls onSelectStop when a stop is clicked', async () => {
    const user = userEvent.setup();
    render(<RouteInfo stops={mockStops} onSelectStop={mockOnSelectStop} />);

    const firstStopButton = screen.getByTestId('stop-item-1');
    await user.click(firstStopButton);

    expect(mockOnSelectStop).toHaveBeenCalledTimes(1);
    expect(mockOnSelectStop).toHaveBeenCalledWith(mockStops[0]);
  });

  it('renders with empty stops array', () => {
    render(<RouteInfo stops={[]} onSelectStop={mockOnSelectStop} />);

    const stopsList = screen.getByTestId('stops-list');
    expect(stopsList.children.length).toBe(0);
  });

  it('includes StatusLegend component', () => {
    render(<RouteInfo stops={mockStops} onSelectStop={mockOnSelectStop} />);

    expect(screen.getByTestId('status-legend')).toBeDefined();
  });
});
