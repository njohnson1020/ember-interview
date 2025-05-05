export const StatusLegend = () => (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <h3 className="font-semibold mb-2">Status Legend:</h3>
    <div className="space-y-1">
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
        <span>On Time</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
        <span>Early</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
        <span>Delayed</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full mr-2 bg-gray-600"></div>
        <span>Past/Skipped</span>
      </div>
    </div>
  </div>
);
