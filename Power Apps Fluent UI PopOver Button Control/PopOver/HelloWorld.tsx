import * as React from 'react';
import { Label } from '@fluentui/react-components';
import {
  makeStyles,
  Button,
  Popover,
  PopoverSurface,
  PopoverTrigger,
} from "@fluentui/react-components";
import type { PopoverProps } from "@fluentui/react-components";

export interface IHelloWorldProps {
  name?: string;
  popoverContent?: string; // Prop for Popover Title
  popoverText?: string; // Prop for Popover Text
}

export class HelloWorld extends React.Component<IHelloWorldProps> {
  public render(): React.ReactNode {
    return (
      <PopoverComponent 
        name={this.props.name || "World"} 
        popoverContent={this.props.popoverContent || "Popover Content"} 
        popoverText={this.props.popoverText || "Popover Text"}
      />  
    )
  }
}
// Functional Component with Power Apps-specific styling
const PopoverComponent = ({ name, popoverContent, popoverText }: { name: string; popoverContent: string; popoverText: string }) => {
  const [open, setOpen] = React.useState(false);
 
  return (
    <Popover open={open} onOpenChange={(e, data) => setOpen(data.open)}>
      <PopoverTrigger disableButtonEnhancement>
        <Button className="glow-button" onClick={() => setOpen(!open)}>
          {name}
        </Button>
      </PopoverTrigger>

      <PopoverSurface tabIndex={-1} className="popover-content">
        <h3 className="content-header">{popoverContent}</h3> {/* Dynamic Title */}
        <p>{popoverText}</p> {/* Dynamic Popover Text */}
      </PopoverSurface>
    </Popover>
  );
};
