import { ProgressSpinner } from 'primereact/progressspinner';
import { Dropdown } from 'primereact/dropdown';
import { DropdownOption, FilterSelectProps } from '@/types/hospital';


export const Loader = () => {
    return (
        <div className="loader-container" style={{ zIndex: 99999999 }}>
            <ProgressSpinner strokeWidth="4" animationDuration="1.0s" />
        </div>
    );
};
export const FilterSelect: React.FC<FilterSelectProps> = ({ selectableOptions = [], selectedOption = '', onSelectChange, customClasses = '', elementId = '', defaultValue = '', showClearIcon = false, showLabel = true, pageTabIndex, disableState, tooltip }) => {
    const selectedValueTemplate = (option: DropdownOption) => {
        if (option) {
            return (
                <div className="item-value flex align-items-center">
                    <div>{option.name}</div>
                </div>
            );
        }
        return <span>Select</span>;
    };

    const optionsTemplate = (option: { name: string }) => {
        return (
            <div className="flex align-items-center">
                <div>{option.name}</div>
            </div>
        );
    };

    return (
        <div className={`filter-select ${customClasses}`}>
            {showLabel ? (
                <label htmlFor={elementId}>{defaultValue}</label>
            ) : (
                ''
            )}
            <Dropdown
                value={selectedOption}
                options={selectableOptions}
                onChange={onSelectChange}
                optionLabel="name"
                filter
                filterBy="name"
                placeholder={defaultValue}
                id={elementId}
                defaultValue={defaultValue}
                valueTemplate={selectedValueTemplate}
                itemTemplate={optionsTemplate}
                name={elementId}
                className="w-full"
                showClear={showClearIcon}
                tabIndex={pageTabIndex}
                disabled={disableState}
                tooltip={tooltip}
            />
        </div>
    );
};
