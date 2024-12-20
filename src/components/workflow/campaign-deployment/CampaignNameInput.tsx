import { Input } from "@/components/ui/input";

interface CampaignNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CampaignNameInput = ({ value, onChange }: CampaignNameInputProps) => {
  return (
    <Input
      placeholder="Enter campaign name..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mb-4"
    />
  );
};

export default CampaignNameInput;