interface PropertyDetailsInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PropertyDetailsInput = ({ value, onChange }: PropertyDetailsInputProps) => {
  return (
    <textarea
      className="w-full p-3 border rounded-md"
      rows={4}
      placeholder="Enter property details or additional information..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default PropertyDetailsInput;