declare module "react-confetti" {
    import { Component } from "react";
    
    export interface ConfettiProps {
        width?: number;
        height?: number;
        numberOfPieces?: number;
        recycle?: boolean;
        run?: boolean;
        colors?: string[];
        opacity?: number;
        gravity?: number;
        wind?: number;
    }
    
    export default class Confetti extends Component<ConfettiProps> {}
}
