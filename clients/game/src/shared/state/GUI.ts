import PubSub from 'pubsub-js';
import { ReactElement } from 'react';
import Panels from '../../components/game/gui/panels/Panels';
import PanelTemplate from '../../components/game/gui/panels/panel_template/PanelTemplate';
import {
    CURSOR_MOVE,
    TOOLTIP_CONTENT,
    CRAFTING_STATION,
    SHOP,
    STOCK_PRICES,
    PANEL_CHANGE,
    SHOW_CHAT_BOX,
    QUICK_CHAT_ENABLED,
} from '../EventTypes';
import { ShopItemConfig } from '../types';

interface ShopType {
    stock: Array<ShopItemConfig>;
}

interface Shop {
    name: string;
    merchantId: string;
    shopType: ShopType;
    prices: Array<number>;
}

interface CraftingStation {
    name: string;
    icon: string;
    typeNumber: number;
}

class GUI {
    cursorX!: number;
    cursorY!: number;
    cursorInLeftSide!: boolean;
    cursorInTopSide!: boolean;
    tooltipContent!: string | ReactElement | null;
    activePanel!: Panels | null;
    quickChatEnabled!: boolean;
    showChatBox!: boolean;
    craftingStation!: CraftingStation | null;
    shop!: Shop | null;

    /** The current percent zoom level for all elements with the 'gui-scalable' style class. */
    guiScale!: number;

    /**
     * The volume of the music. 0 is no music, 100 is full volume. Can't use floats due to imperfect decimal precision.
     * @todo find somewhere else for this, doesn't really belong with this GUI stuff
     */
    musicVolume!: number;

    /**
     * The volume of the sound effects. 0 is no effects, 100 is full volume. Can't use floats due to imperfect decimal precision.
     * @todo find somewhere else for this, doesn't really belong with this GUI stuff
     */
    effectsVolume!: number;

    /** Whether the FPS counter should be shown. */
    showFPS!: boolean;

    /** Whether profanity in chat messages from other players should be censored. */
    profanityFilterEnabled!: boolean;

    /** Whether tiles on the darkness layer of the tilemap should flicker when affected by a light source. */
    lightFlickerEnabled!: boolean;

    /** Whether the virtual D-pad is enabled. */
    virtualDPadEnabled!: boolean;

    constructor() {
        this.init();

        document.onmousemove = (event) => {
            this.setCursorX(event.clientX);
            this.setCursorY(event.clientY);

            PubSub.publish(CURSOR_MOVE, {
                new: {
                    cursorX: this.cursorX,
                    cursorY: this.cursorY,
                },
            });
        };
    }

    init() {
        this.cursorX = 0;

        this.cursorY = 0;

        this.cursorInLeftSide = false;

        this.cursorInTopSide = false;

        this.tooltipContent = null;

        this.activePanel = null;

        this.quickChatEnabled = true;

        this.showChatBox = false;

        this.craftingStation = null;

        this.shop = null;

        this.guiScale = 100;

        this.musicVolume = 50;

        this.effectsVolume = 50;

        this.showFPS = false;

        this.profanityFilterEnabled = true;

        this.lightFlickerEnabled = true;

        this.virtualDPadEnabled = false;
    }

    setCursorX(value: number) {
        this.cursorX = value;
        if (this.cursorX < (window.innerWidth / 2)) {
            this.cursorInLeftSide = true;
        }
        else {
            this.cursorInLeftSide = false;
        }
    }

    setCursorY(value: number) {
        this.cursorY = value;
        if (this.cursorY < (window.innerHeight / 2)) {
            this.cursorInTopSide = true;
        }
        else {
            this.cursorInTopSide = false;
        }
    }

    setActivePanel(value: Panels) {
        this.activePanel = value;

        PubSub.publish(PANEL_CHANGE, { new: value });
    }

    setQuickChatEnabled(value: boolean) {
        this.quickChatEnabled = value;

        PubSub.publish(QUICK_CHAT_ENABLED, { new: value });
    }

    setShowChatBox(value: boolean) {
        this.showChatBox = value;

        PubSub.publish(SHOW_CHAT_BOX, { new: value });
    }

    setCraftingStation(typeNumber: number, name: string, icon: string) {
        this.craftingStation = {
            typeNumber,
            name,
            icon,
        };

        PubSub.publish(CRAFTING_STATION, this.craftingStation);
    }

    // setShop(merchantId: string, name: string, shopType: ShopType) {
    //     this.shop = {
    //         // The merchant entity that this player is trading with, to send when buying something so the server knows who to buy from.
    //         merchantId,
    //         name,
    //         shopType,
    //     };

    //     PubSub.publish(SHOP, this.shop);
    // }

    setStockPrices(value: Array<number>) {
        if(this.shop) {
            this.shop.prices = value;

            PubSub.publish(STOCK_PRICES, this.shop.prices);
        }
    }

    setTooltipContent(content: ReactElement | string | null) {
        this.tooltipContent = content;

        PubSub.publish(TOOLTIP_CONTENT, content);
    }
}

export default GUI;
