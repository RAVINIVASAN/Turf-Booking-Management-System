import { Button } from './Button';

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="mb-6 p-4 bg-teal-50 rounded-full">
          <Icon size={48} className="text-teal-600" />
        </div>
      )}

      <h3 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>

      <p className="text-gray-600 text-center max-w-md mb-8">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          size="md"
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
