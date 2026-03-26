import { useHospitalSettingsContext } from '@/libs/contextProviders/AppContexts';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { Slider } from 'primereact/slider';

const InventorySettings = () => {
    const { state: settings, updateSetting } = useHospitalSettingsContext();
    return (
        <>
            <div className="grid">
                <div className="col-12 lg:col-6">
                    <h4>Stock Management</h4>

                    <div className="field">
                        <label htmlFor="lowStockAlert">Low Stock Alert Threshold (%)</label>
                        <div className="flex align-items-center gap-3">
                            <Slider value={settings.inventory.lowStockAlertPercentage} onChange={(e) => updateSetting('inventory', 'lowStockAlertPercentage', e.value)} className="flex-1" />
                            <span className="w-3rem text-center">{settings.inventory.lowStockAlertPercentage}%</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Enable Auto-Reorder</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.inventory.autoReorderEnabled} onChange={(e) => updateSetting('inventory', 'autoReorderEnabled', e.value)} />
                            <span className="ml-2">{settings.inventory.autoReorderEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    {settings.inventory.autoReorderEnabled && (
                        <div className="field">
                            <label htmlFor="reorderQuantity">Default Reorder Quantity</label>
                            <InputNumber id="reorderQuantity" value={settings.inventory.defaultReorderQuantity} onValueChange={(e) => updateSetting('inventory', 'defaultReorderQuantity', e.value)} min={1} className="w-full" />
                        </div>
                    )}

                    <div className="field">
                        <label htmlFor="expiryAlert">Expiry Alert (days before)</label>
                        <InputNumber id="expiryAlert" value={settings.inventory.expiryAlertDays} onValueChange={(e) => updateSetting('inventory', 'expiryAlertDays', e.value)} suffix=" days" min={1} max={365} className="w-full" />
                    </div>
                </div>

                <div className="col-12 lg:col-6">
                    <h4>Pricing & Tracking</h4>

                    <div className="field">
                        <label htmlFor="defaultMarkup">Default Markup (%)</label>
                        <InputNumber id="defaultMarkup" value={settings.inventory.defaultMarkup} onValueChange={(e) => updateSetting('inventory', 'defaultMarkup', e.value)} suffix="%" min={0} max={200} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="discountLimit">Maximum Discount Allowed (%)</label>
                        <InputNumber id="discountLimit" value={settings.inventory.discountLimit} onValueChange={(e) => updateSetting('inventory', 'discountLimit', e.value)} suffix="%" min={0} max={100} className="w-full" />
                    </div>

                    <div className="field">
                        <label>Enable Batch Tracking</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.inventory.enableBatchTracking} onChange={(e) => updateSetting('inventory', 'enableBatchTracking', e.value)} />
                            <span className="ml-2">{settings.inventory.enableBatchTracking ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Allow Negative Stock</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.inventory.allowNegativeStock} onChange={(e) => updateSetting('inventory', 'allowNegativeStock', e.value)} />
                            <span className="ml-2">{settings.inventory.allowNegativeStock ? 'Allowed' : 'Not Allowed'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default InventorySettings;
