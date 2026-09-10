import { Textarea } from '@troott/ui/textarea';
import { Label } from '@troott/ui/label';
import type { IMinistryDescription } from '@/utils/interfaces.util';

const MinistryDescription = (data: IMinistryDescription) => {
    const {
        id,
        description,
        label = 'Description',
        className = '',
        onChange,
    } = data;

    return (
        <div className={`${className}`}>
            <Label htmlFor="description">{label}</Label>
            <div className="mt-2">
                <Textarea
                    id={id || 'description'}
                    key="description"
                    value={description}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="bg-muted/50 resize-none"
                    style={{
                        boxShadow: 'none',
                        outline: 'none',
                    }}
                    placeholder="Describe your ministry's purpose or mission"
                    rows={4}
                />
            </div>
        </div>
    );
};

export default MinistryDescription;
