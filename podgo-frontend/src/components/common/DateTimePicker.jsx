import { useState, useRef, useEffect } from 'react';

// Utility to generate dates
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    
    let label = '';
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else {
      label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    
    dates.push({
      label,
      value: d.toISOString().split('T')[0]
    });
  }
  return dates;
};

const DATES = generateDates();
const HOURS = Array.from({ length: 12 }, (_, i) => ({ label: `${i === 0 ? 12 : i}`, value: i === 0 ? 12 : i }));
const MINUTES = Array.from({ length: 12 }, (_, i) => {
  const val = i * 5;
  return { label: val.toString().padStart(2, '0'), value: val };
});
const AMPM = [{ label: 'AM', value: 'AM' }, { label: 'PM', value: 'PM' }];

const ITEM_HEIGHT = 44; // pixels

const PickerColumn = ({ items, selectedValue, onChange, widthClass = "w-16", alignClass = "text-center" }) => {
  const containerRef = useRef(null);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  // Initialize scroll position
  useEffect(() => {
    if (containerRef.current) {
      const index = items.findIndex(item => item.value === selectedValue);
      if (index >= 0) {
        containerRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, []); // Only on mount

  const handleScroll = (e) => {
    isScrolling.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      const index = Math.round(e.target.scrollTop / ITEM_HEIGHT);
      if (items[index] && items[index].value !== selectedValue) {
        onChange(items[index].value);
      }
      // Snap to exact position
      e.target.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth'
      });
    }, 150); // debounce scroll end
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className={`h-[220px] overflow-y-auto no-scrollbar snap-y snap-mandatory relative z-10 ${widthClass}`}
      style={{ scrollBehavior: isScrolling.current ? 'auto' : 'smooth' }}
    >
      <div style={{ height: `${ITEM_HEIGHT * 2}px` }} className="snap-start" />
      {items.map((item) => {
        const isSelected = item.value === selectedValue;
        return (
          <div 
            key={item.value} 
            className={`h-[44px] flex items-center justify-center snap-center transition-colors duration-200 ${alignClass} ${isSelected ? 'text-on-surface font-semibold text-[17px]' : 'text-on-surface-variant/40 text-[15px]'}`}
          >
            {item.label}
          </div>
        );
      })}
      <div style={{ height: `${ITEM_HEIGHT * 2}px` }} className="snap-end" />
    </div>
  );
};

export default function DateTimePicker({ date, time, onDateChange, onTimeChange }) {
  // Parse initial state
  const [selectedDate, setSelectedDate] = useState(date || DATES[0].value);
  
  let initialHour = 10;
  let initialMin = 0;
  let initialAmPm = 'AM';
  
  if (time) {
    const [h, m] = time.split(':').map(Number);
    initialAmPm = h >= 12 ? 'PM' : 'AM';
    initialHour = h % 12 || 12;
    // snap minute to nearest 5
    initialMin = Math.round(m / 5) * 5;
    if (initialMin === 60) { initialMin = 0; initialHour = (initialHour % 12) + 1; }
  }

  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMin, setSelectedMin] = useState(initialMin);
  const [selectedAmPm, setSelectedAmPm] = useState(initialAmPm);

  // Notify parent on any change
  useEffect(() => {
    onDateChange(selectedDate);
    
    // Convert back to 24h format
    let h24 = selectedHour;
    if (selectedAmPm === 'PM' && h24 < 12) h24 += 12;
    if (selectedAmPm === 'AM' && h24 === 12) h24 = 0;
    
    const formattedTime = `${h24.toString().padStart(2, '0')}:${selectedMin.toString().padStart(2, '0')}`;
    onTimeChange(formattedTime);
  }, [selectedDate, selectedHour, selectedMin, selectedAmPm]);

  return (
    <div className="relative w-full bg-surface-container-low rounded-[20px] p-2 select-none">
      {/* Highlight Band */}
      <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-[44px] bg-surface-container-high rounded-[12px] z-0 pointer-events-none shadow-inner" />
      
      <div className="flex items-center justify-between px-2">
        <PickerColumn 
          items={DATES} 
          selectedValue={selectedDate} 
          onChange={setSelectedDate} 
          widthClass="flex-1 min-w-[100px]"
          alignClass="justify-start pl-4"
        />
        <div className="flex items-center gap-1">
          <PickerColumn 
            items={HOURS} 
            selectedValue={selectedHour} 
            onChange={setSelectedHour} 
            widthClass="w-12"
          />
          <PickerColumn 
            items={MINUTES} 
            selectedValue={selectedMin} 
            onChange={setSelectedMin} 
            widthClass="w-12"
          />
          <PickerColumn 
            items={AMPM} 
            selectedValue={selectedAmPm} 
            onChange={setSelectedAmPm} 
            widthClass="w-14"
          />
        </div>
      </div>
    </div>
  );
}
